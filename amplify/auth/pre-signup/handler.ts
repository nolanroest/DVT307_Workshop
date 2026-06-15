import { PreSignUpTriggerEvent, PreSignUpTriggerHandler } from 'aws-lambda';

export const handler: PreSignUpTriggerHandler = async (event: PreSignUpTriggerEvent) => {
  try {
    // Auto-confirm the user account
    event.response.autoConfirmUser = true;
    
    // Auto-verify the email attribute if it exists
    if (event.request.userAttributes.email) {
      event.response.autoVerifyEmail = true;
    }

    // Auto-verify phone number if it exists (optional)
    if (event.request.userAttributes.phone_number) {
      event.response.autoVerifyPhone = true;
    }

    return event;

  } catch (error) {    
    return event;
  }
};