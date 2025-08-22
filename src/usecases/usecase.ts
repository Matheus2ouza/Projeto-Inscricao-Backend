export interface Usecase<Input, Output> {
  execute(Input: Input): Promise<Output>;
}