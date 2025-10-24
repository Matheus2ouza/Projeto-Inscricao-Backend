import { Injectable } from '@nestjs/common';
import { UserGateway } from 'src/domain/repositories/user.geteway';

export type FindAllNamesUserOutput = {
  id: string;
  username: string;
}[];

@Injectable()
export class FindAllNamesUserUsecase {
  public constructor(private readonly userGateway: UserGateway) {}

  public async execute(): Promise<FindAllNamesUserOutput> {
    const allUsername = await this.userGateway.findAll();

    const output: FindAllNamesUserOutput = allUsername.map((username) => ({
      id: username.getId(),
      username: username.getUsername(),
    }));
    console.log(output);
    return output;
  }
}
