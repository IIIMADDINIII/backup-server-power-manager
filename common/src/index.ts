import { Type, type Static } from '@sinclair/typebox';

export type StatusUnknown = Static<typeof StatusUnknown>;
export const StatusUnknown = Type.Object({
  status: Type.Literal('unknown')
});

export type StatusStopped = Static<typeof StatusStopped>;
export const StatusStopped = Type.Object({
  status: Type.Literal('stopped')
});

export type StatusStarting = Static<typeof StatusStarting>;
export const StatusStarting = Type.Object({
  status: Type.Literal('starting')
});

export type StatusStarted = Static<typeof StatusStarted>;
export const StatusStarted = Type.Object({
  status: Type.Literal('started')
});

export type StatusStopping = Static<typeof StatusStopping>;
export const StatusStopping = Type.Object({
  status: Type.Literal('stopping')
});

export type APIStatusResponse = Static<typeof APIStatusResponse>;
export const APIStatusResponse = Type.Union([
  StatusUnknown,
  StatusStopped,
  StatusStarting,
  StatusStarted,
  StatusStopping
]);
