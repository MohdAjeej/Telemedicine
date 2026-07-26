import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { messageService } from './message.service';

export const messageController = {
  startConversation: asyncHandler(async (req: Request, res: Response) => {
    const conversation = await messageService.startConversation(req.user!.id, req.body.otherUserId);
    sendSuccess(res, conversation, 'Conversation ready', HTTP_STATUS.CREATED);
  }),

  listConversations: asyncHandler(async (req: Request, res: Response) => {
    const conversations = await messageService.listConversations(req.user!.id);
    sendSuccess(res, conversations);
  }),

  listMessages: asyncHandler(async (req: Request, res: Response) => {
    const messages = await messageService.listMessages(req.params.id, req.user!.id);
    sendSuccess(res, messages);
  }),

  send: asyncHandler(async (req: Request, res: Response) => {
    const message = await messageService.send(req.params.id, req.user!.id, req.body.content, req.body.attachments);
    sendSuccess(res, message, 'Message sent', HTTP_STATUS.CREATED);
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    await messageService.markRead(req.params.id, req.user!.id);
    sendSuccess(res, null, 'Conversation marked as read');
  }),
};
