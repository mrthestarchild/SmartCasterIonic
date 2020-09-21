import { SpotSetting } from '../spot-setting.model';

export class SpotResponse {
    public Id: number;
    public DateCreate: Date;
    public DateUpdate: Date;
    public DateDelete: string;
    public Name: string;
    public Description: string;
    public UploadUserId: number;
    public OwnerUserId: number;
    public FileTypeId: number;
    public Uri: string;
    public DateUriValidated: Date;
    public IsGainOverride: boolean;
    public GainAuto: string;
    public DateGainAuto: Date;
    public GainManual: string;
    public DurationMinutes: number;
    public Setting: SpotSetting = new SpotSetting();
}
