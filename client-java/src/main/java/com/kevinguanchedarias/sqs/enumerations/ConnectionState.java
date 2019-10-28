/**
 * 
 */
package com.kevinguanchedarias.sqs.enumerations;

/**
 * Represents the current state of a connection
 * 
 * @since 1.0.0
 * @author Kevin Guanche Darias <kevin@kevinguanchedarias.com>
 */
public enum ConnectionState {
	NOT_WANTING_CONNECTION, NOT_CONNECTED, CONNECTED_BEFORE_CONFIG, CONNECTED_AFTER_CONFIG;
}
