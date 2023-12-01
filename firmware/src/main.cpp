#include <Arduino.h>

#define RED_LED 2
#define BLUE_LED 3
#define GREEN_LED 4

#define FLASH_LED 13

#define RELAY 5

#define HEARBEAT_COMMAND "HEARTBEAT"
#define HEARBEAT_REPLY "HEARTBEAT_OK"
#define HEARBEAT_DURATION 40

#define SHOCK_DURATION_COMMAND "SHOCK_DURATION"
#define SHOCK_DURATION_ERROR "SHOCK_DURATION_FAIL"
#define SHOCK_DURATION_REPLY "SHOCK_DURATION_OK"

#define SHOCK_COMMAND "SHOCK"
#define SHOCK_COMMAND_REPLY "SHOCK_OK"

int heartbeatCheck;
int shockDuration;
int flashDelay;
boolean flashState;

void trigger()
{
	digitalWrite(BLUE_LED, HIGH);
	digitalWrite(RELAY, HIGH);
	delay(shockDuration);
	digitalWrite(BLUE_LED, LOW);
	digitalWrite(RELAY, LOW);
}

void setup()
{
	heartbeatCheck = 0;
	shockDuration = 250;
	flashDelay = 0;
	flashState = false;

	pinMode(RED_LED, OUTPUT);
	pinMode(GREEN_LED, OUTPUT);
	pinMode(BLUE_LED, OUTPUT);

	pinMode(FLASH_LED, OUTPUT);

	pinMode(RELAY, OUTPUT);

	Serial.begin(9600);
}

void loop()
{
	while (Serial.available() > 0)
	{
		String command = Serial.readStringUntil('\n');

		if (command == HEARBEAT_COMMAND)
		{
			heartbeatCheck = HEARBEAT_DURATION;
			Serial.println(HEARBEAT_REPLY);
		}
		else if (command == SHOCK_DURATION_COMMAND)
		{
			float value = Serial.parseFloat();
			int delay = value;
			if (delay < 0 || delay > 10000)
			{
				Serial.println(SHOCK_DURATION_ERROR);
			}
			else
			{
				shockDuration = delay;
				Serial.println(String(SHOCK_DURATION_REPLY) + ":" + String(delay).c_str());
			}
		}
		else if (command == SHOCK_COMMAND)
		{
			Serial.println(SHOCK_COMMAND_REPLY);
			trigger();
		}
	}

	if (flashDelay > 0)
	{
		flashDelay--;
	}
	else
	{
		flashDelay = 3;
		flashState = !flashState;
		digitalWrite(FLASH_LED, flashState ? HIGH : LOW);
	}

	if (heartbeatCheck > 0)
	{
		heartbeatCheck--;
		digitalWrite(RED_LED, LOW);
		digitalWrite(GREEN_LED, HIGH);
	}
	else
	{
		digitalWrite(RED_LED, HIGH);
		digitalWrite(GREEN_LED, LOW);
	}

	delay(100);
}