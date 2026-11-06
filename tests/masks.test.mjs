import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidEmail, isValidName, isValidPhone, maskEmail, maskMeasure, maskName, maskPhone } from "../src/shared/domain/masks.js";

test("a máscara de e-mail tira espaços, acentos e maiúsculas", () => {
  assert.equal(maskEmail(" João.Silva @Gmail.com "), "joao.silva@gmail.com");
});

test("a máscara de e-mail mantém um único @", () => {
  assert.equal(maskEmail("a@b@c.com"), "a@bc.com");
});

test("a máscara de e-mail não apaga o que ainda está sendo digitado", () => {
  assert.equal(maskEmail("ana@"), "ana@");
  assert.equal(maskEmail("ana@gmail."), "ana@gmail.");
  assert.equal(maskEmail(""), "");
});

test("aceita e-mails válidos", () => {
  for (const email of ["ana@gmail.com", "ana.souza+treino@empresa.com.br", "a_b-c@sub.dominio.io", "ANA@GMAIL.COM"]) {
    assert.equal(isValidEmail(email), true, email);
  }
});

test("recusa e-mails inválidos", () => {
  for (const email of ["", "ana", "ana@", "@gmail.com", "ana@gmail", "ana@gmail.c", "ana@.com", "ana@-x.com", "ana@x-.com", ".ana@gmail.com", "ana.@gmail.com", "an..a@gmail.com", "ana@gmail..com"]) {
    assert.equal(isValidEmail(email), false, email);
  }
});

test("a máscara de nome mantém acentos, apóstrofo e hífen", () => {
  assert.equal(maskName("João D’Ávila Sant'Anna-Lima"), "João D'Ávila Sant'Anna-Lima");
});

test("a máscara de nome tira números, símbolos e espaços sobrando", () => {
  assert.equal(maskName("  Ana1  Maria@ 😀"), "Ana Maria ");
});

test("a máscara de nome deixa digitar o sobrenome", () => {
  assert.equal(maskName("Ana "), "Ana ");
});

test("nome precisa de ao menos 2 letras", () => {
  assert.equal(isValidName("Jo"), true);
  assert.equal(isValidName(" J "), false);
  assert.equal(isValidName(""), false);
});

test("a máscara de telefone formata celular e fixo", () => {
  assert.equal(maskPhone("11987654321"), "(11) 98765-4321");
  assert.equal(maskPhone("1133334444"), "(11) 3333-4444");
  assert.equal(maskPhone("119"), "(11) 9");
  assert.equal(maskPhone(""), "");
});

test("a máscara de telefone tira o +55 de número colado", () => {
  assert.equal(maskPhone("+55 11 98765-4321"), "(11) 98765-4321");
  assert.equal(maskPhone("5511987654321"), "(11) 98765-4321");
});

test("um dígito a mais não confunde o DDD 55 com o DDI", () => {
  assert.equal(maskPhone("(55) 99876-54321"), "(55) 99876-5432");
});

test("aceita telefones válidos", () => {
  for (const phone of ["(11) 98765-4321", "(55) 99876-5432", "(21) 3333-4444"]) {
    assert.equal(isValidPhone(phone), true, phone);
  }
});

test("recusa telefones inválidos", () => {
  for (const phone of ["", "(11) 9876", "(20) 98765-4321", "(11) 88765-4321", "(00) 3333-4444"]) {
    assert.equal(isValidPhone(phone), false, phone);
  }
});

test("a máscara de medida usa vírgula e limita o tamanho", () => {
  assert.equal(maskMeasure("82.5"), "82,5");
  assert.equal(maskMeasure("82,55"), "82,5");
  assert.equal(maskMeasure("1755"), "175");
  assert.equal(maskMeasure("8,2,5"), "8,2");
  assert.equal(maskMeasure("82,"), "82,");
  assert.equal(maskMeasure(",5"), "");
  assert.equal(maskMeasure("80kg"), "80");
});
