/**
 * 
 */
package com.kevinguanchedarias.sqs.exception;

/**
 * Thrown when the JSON is not valid
 * 
 * @since 1.1.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class SqsBadJsonException extends RuntimeException {
	/**
	 * @since 1.1.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	private static final long serialVersionUID = 4215601971772682133L;

	/**
	 * @param message
	 * @param cause
	 * @since 1.1.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public SqsBadJsonException(String message, Exception cause) {
		super(message, cause);
	}
}
