import { SpotCollectionSettings } from '../spot-collection-settings.model';
import { SpotRequest } from './spot-request.model';

export class SpotCollectionRequest {
    public Id: number;
    public UserId: number;
    public Name: string;
    public Description: string;
    public Settings: SpotCollectionSettings;
    public ShortCode: string;
    public SpotList: Array<SpotRequest>;
}
