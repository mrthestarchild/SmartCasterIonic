import { SoundLevelCollectionSetting } from '../sound-level-collection-setting.model';
import { SoundLevelResponse } from './sound-level-response.model';

/**
 * @deprecated Since version 0.1. Will be deleted in version 1.0. Use SoundLevelResponse instead.
 */
export class SoundLevelCollectionResponse {
    public Id: number;
    public DateCreate: Date;
    public DateUpdate: Date;
    public DateDeleted: Date;
    public Name: string;
    public Description: string;
    public UserId: number;
    public Setting: SoundLevelCollectionSetting;
    public ShortCode: string;
    public SoundLevelList: Array<SoundLevelResponse>;
}
