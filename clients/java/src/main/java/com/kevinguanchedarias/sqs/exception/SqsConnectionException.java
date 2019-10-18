/**
 * 
 */
package com.kevinguanchedarias.sqs.exception;

/**
 * Thrown on connection errors
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class SqsConnectionException extends RuntimeException {
	private static final long serialVersionUID = 6821800119208485942L;

	/**
	 * 
	 * @param message
	 * @param cause
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public SqsConnectionException(String message, Throwable cause) {
		super(message, cause);
	}

}
