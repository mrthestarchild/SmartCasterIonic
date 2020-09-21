import { PadCollectionSettings } from '../pad-collection-settings.model';
import { SpotResponse } from './spot-response.model';

export class PadCollectionResponse {
    public Id: number;
    public DateCreate: Date;
    public DateUpdate: Date;
    public DateDelete: Date;
    public DatePublish: Date;
    public DateDeList: Date;
    public Name: string;
    public Description: string;
    public Settings: PadCollectionSettings;
    public ShortCode: string;
    public SpotList: SpotResponse[];
}
