import { AccountResponse } from './account-response.model';
import { UserResponse } from './user-response.model';

export class UserAccountInfoResponse {
    public AccountInfo: AccountResponse;
    public UserInfo: UserResponse;
}
