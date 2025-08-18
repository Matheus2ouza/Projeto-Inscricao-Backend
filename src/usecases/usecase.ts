export interface Usercase<Input, Output> {
  execute(Input: Input): Promise<Output>;
}