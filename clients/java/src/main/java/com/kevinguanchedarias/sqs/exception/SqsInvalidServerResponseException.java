/**
 * 
 */
package com.kevinguanchedarias.sqs.exception;

/**
 * Thrown when the server sent an invalid response
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public class SqsInvalidServerResponseException extends RuntimeException {
	private static final long serialVersionUID = 4628647045493023241L;

	/**
	 * Creates from a expectation
	 * 
	 * @param expected
	 * @param received
	 * @return
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	public static SqsInvalidServerResponseException fromExpectation(String expected, String received) {
		return new SqsInvalidServerResponseException("Server sent " + received + ", but expected: " + expected);
	}

	private SqsInvalidServerResponseException(String message) {
		super(message);
	}

}
