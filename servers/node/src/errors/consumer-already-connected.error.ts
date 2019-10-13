import { AbortSessionError } from './abort-session.error';

/**
 * Thrown when there is already a consumer, and other connection tries to become a consumer
 *
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 * @since 1.0.0
 * @export
 * @class ConsumerAlreadyConnectedError
 * @extends {Error}
 */
export class ConsumerAlreadyConnectedError extends AbortSessionError { }