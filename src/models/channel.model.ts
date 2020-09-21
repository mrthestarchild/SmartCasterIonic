import { MixerKnob } from './mixer-knob.model';

export class Channel {
    public Priority: number;
    public CurrentVolume: number;
    public ChannelColor: string;
    public ChannelDisplayName: string;
    public ChannelIconName: string;
    public MixerKnobs: Array<MixerKnob>;
    public IsMuted: boolean;
}
