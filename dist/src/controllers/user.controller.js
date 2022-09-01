"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = require("bcrypt");
const zod_1 = require("zod");
const prismaClient_1 = __importDefault(require("../../prisma/prismaClient"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerPayloadSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email" }),
    password: zod_1.z.string().min(3, { message: "Password too short" }),
    name: zod_1.z.string().min(2, { message: "Name is too short" }),
});
const loginPayloadSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email" }),
    password: zod_1.z.string().min(3, { message: "Password too short" }),
});
const userController = {
    login: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = loginPayloadSchema.parse(req.body);
            const user = yield prismaClient_1.default.user.findUnique({
                where: {
                    email,
                },
            });
            const token = jsonwebtoken_1.default.sign({ uid: user === null || user === void 0 ? void 0 : user.id }, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });
            if (!user) {
                next(new Error("User not found"));
                return;
            }
            if (!(yield (0, bcrypt_1.compare)(password, user.password))) {
                next(new Error("Invalid password"));
                return;
            }
            res
                .status(200)
                .send({ email: user.email, name: user.name, id: user.id, token });
        }
        catch (err) {
            next(err);
        }
    }),
    register: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password, name } = registerPayloadSchema.parse(req.body);
            const user = yield prismaClient_1.default.user.create({
                data: {
                    email,
                    password: yield (0, bcrypt_1.hash)(password, 10),
                    name,
                },
            });
            res.status(200).send({ email: user.email });
        }
        catch (err) {
            next(err);
        }
    }),
};
exports.default = userController;
