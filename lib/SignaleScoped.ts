import { Signale } from "signale";

export function SignaleScoped(scopeName: string): Signale {
    return new Signale({ scope: scopeName });
}