import type { messagingApi } from '@line/bot-sdk';

export class LineService {
  private readonly fetchOptions: RequestInit;

  constructor(private readonly token: string) {
    this.fetchOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    };
  }

  public async replyMessage(
    req: messagingApi.ReplyMessageRequest,
  ): Promise<messagingApi.ReplyMessageResponse> {
    const endpoint = 'https://api.line.me/v2/bot/message/reply';

    return await (
      await fetch(endpoint, {
        ...this.fetchOptions,
        method: 'POST',
        body: JSON.stringify(req),
      })
    ).json<messagingApi.ReplyMessageResponse>();
  }

  public async getGroupSummary(
    groupId: string,
  ): Promise<messagingApi.GroupSummaryResponse> {
    const endpoint = `https://api.line.me/v2/bot/group/${groupId}/summary`;

    return await (
      await fetch(endpoint, { ...this.fetchOptions, method: 'GET' })
    ).json<messagingApi.GroupSummaryResponse>();
  }
}
