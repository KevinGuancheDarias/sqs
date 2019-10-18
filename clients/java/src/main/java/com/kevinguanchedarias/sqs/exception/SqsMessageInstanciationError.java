/**
 * 
 */
package com.kevinguanchedarias.sqs.exception;

/**
 * If there was an error instanciating the class
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class SqsMessageInstanciationError extends RuntimeException {
	private static final long serialVersionUID = 1402356528730809975L;

	/**
	 * 
	 * @param message
	 * @param e
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public SqsMessageInstanciationError(String message, Exception e) {
		super(message, e);
	}
}
