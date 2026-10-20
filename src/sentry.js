import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://6ff0cb410630f4a95036dacb4635717e@o4512262917062656.ingest.us.sentry.io/4512273137598464",
  environment: __DEV__ ? "development" : "production",
  sendDefaultPii: false,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2
});

export { Sentry };
