import { SpotSetting } from '../spot-setting.model';

export class SpotRequest {
    public Id: number;
    public Name: string;
    public Description: string;
    public UpdatedUserId: number;
    public OwnerUserId: number;
    public FileTypeId: number;
    public Uri: string;
    public DateUriValidated: Date;
    public IsGainOverride: boolean;
    public GainAuto: string;
    public DateGainAuto: Date;
    public GainManual: string;
    public Setting: SpotSetting;
    public DurationMinutes: number;
}
