import { Mixer } from '../mixer.model';
import { ChannelColor } from '../channel-color.model';

export class SoundLevelResponse {
    public Id: number;
    public AccountId: number;
    public DateCreate: Date;
    public DateUpdate: Date;
    public DateDelete: Date;
    public Name: string;
    public Description: string;
    public AuthorUserId: number;
    public TechUserId: number;
    public IsInput: boolean;
    public MixerChannelsJson: Mixer;
    public ChannelColor: ChannelColor;
}
