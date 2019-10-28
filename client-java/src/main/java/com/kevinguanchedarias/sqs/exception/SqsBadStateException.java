/**
 * 
 */
package com.kevinguanchedarias.sqs.exception;

/**
 * When tried to run an action outside of the expected flow
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class SqsBadStateException extends RuntimeException {
	private static final long serialVersionUID = -5819963280936122699L;

	/**
	 * @param message
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public SqsBadStateException(String message) {
		super(message);
	}

}
