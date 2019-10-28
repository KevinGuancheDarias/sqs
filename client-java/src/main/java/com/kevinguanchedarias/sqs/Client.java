/**
 * 
 */
package com.kevinguanchedarias.sqs;

/**
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public interface Client {

	/**
	 * Connects to the SQS server
	 * 
	 * @param host
	 * @param port
	 * @param queue
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	void connect(String host, int port, String queue);

	/**
	 * Closes the connection with the SQS server
	 * 
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	void quit();

	/**
	 * Returns true if the connection is still alive
	 * 
	 * @return
	 * @since 1.0.0
	 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
	 */
	boolean isAlive();
}
