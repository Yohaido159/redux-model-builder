import {
  sagaSendToProcess,
  sagaSendToSagaProcessTakeEveryStart,
} from "./sagas/global.sagas";

export {
  sagaSendToProcess as sendToProcess,
  sagaSendToSagaProcessTakeEveryStart as takeEverySendToProcess,
};
