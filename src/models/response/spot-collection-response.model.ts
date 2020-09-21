import { SpotCollectionSettings } from '../spot-collection-settings.model';
import { SpotResponse } from './spot-response.model';

export class SpotCollectionResponse {
    public Id: number;
    public DateCreate: Date;
    public DateUpdate: Date;
    public DateDelete: Date;
    public DatePublish: Date;
    public DateDeList: Date;
    public Name: string;
    public Description: string;
    public Settings: SpotCollectionSettings;
    public ShortCode: string;
    public SpotList: SpotResponse[];
}
