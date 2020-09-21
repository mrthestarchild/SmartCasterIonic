export class BaseResponse<T> {
    public StatusCode: string;
    public StatusMessage: string;
    public ExceptionInfo: string;
    public CheckFailed: boolean;
    public Data: T;
}
