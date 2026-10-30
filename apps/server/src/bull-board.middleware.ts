import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import basicAuth from "express-basic-auth";
import { config } from "./common/config";

@Injectable()
export class BullBoardAuthMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		basicAuth({
			users: {
				[config.bullBoard.user]: config.bullBoard.password,
			},
			challenge: true,
		})(req, res, next);
	}
}
