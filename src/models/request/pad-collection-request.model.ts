import { SpotCollectionSettings } from '../spot-collection-settings.model';
import { SpotRequest } from './spot-request.model';
import { PadCollectionSettings } from '../pad-collection-settings.model';

export class PadCollectionRequest {
    public Id: number;
    public UserId: number;
    public Name: string;
    public Description: string;
    public Settings: PadCollectionSettings;
    public ShortCode: string;
    public SpotList: Array<SpotRequest>;
}
