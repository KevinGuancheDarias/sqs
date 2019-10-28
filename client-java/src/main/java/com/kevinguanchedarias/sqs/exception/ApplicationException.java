/**
 * 
 */
package com.kevinguanchedarias.sqs.exception;

/**
 * Thrown in the Application.main() only
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class ApplicationException extends RuntimeException {
	private static final long serialVersionUID = -9076251059919842704L;

	/**
	 * @param message
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public ApplicationException(String message) {
		super(message);
	}

}
