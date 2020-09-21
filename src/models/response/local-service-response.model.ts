import { StatusCode } from 'src/utils/status-code.enum';

export class LocalServiceResponse<T> {
    public StatusCode: StatusCode;
    public Data: T;
}
