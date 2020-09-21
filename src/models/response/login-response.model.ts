import { SpotResponse } from './spot-response.model';
import { SoundLevelResponse } from './sound-level-response.model';
import { AccountResponse } from './account-response.model';
import { UserResponse } from './user-response.model';
import { SettingValue } from './setting-value.model';
import { SpotCollectionResponse } from './spot-collection-response.model';
import { PadCollectionResponse } from './pad-collection-response.model';

export class LoginResponse {
    public AccountInfo: AccountResponse;
    public UserInfo: UserResponse;
    public UserSettings: Map<string, SettingValue>;
    public SoundLevels: SoundLevelResponse[];
    public SpotCollections: SpotCollectionResponse[];
    public PadCollections: PadCollectionResponse[];
    public Spots: SpotResponse[];
}
