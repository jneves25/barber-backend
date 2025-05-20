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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionController = void 0;
const PermissionService_1 = require("./PermissionService");
const permissionService = new PermissionService_1.PermissionService();
class PermissionController {
    static createPermission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const permission = yield permissionService.createPermission(data);
                res.status(201).json(permission);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao criar permissão', error });
            }
        });
    }
    static getAllPermissions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const permissions = yield permissionService.getAllPermissions();
                res.status(200).json(permissions);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter permissões', error });
            }
        });
    }
    static getPermissionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const permission = yield permissionService.getPermissionById(parseInt(id));
                if (permission) {
                    res.status(200).json(permission);
                }
                else {
                    res.status(404).json({ message: 'Permissão não encontrada' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao obter permissão', error });
            }
        });
    }
    static updatePermission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const data = req.body;
                const updatedPermission = yield permissionService.updatePermission(parseInt(id), data);
                res.status(200).json(updatedPermission);
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao atualizar permissão', error });
            }
        });
    }
    static deletePermission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deletedPermission = yield permissionService.deletePermission(parseInt(id));
                if (deletedPermission) {
                    res.status(204);
                    return;
                }
                res.status(404).json({ message: 'Permissão não encontrada' });
            }
            catch (error) {
                res.status(500).json({ message: 'Erro ao excluir permissão', error });
            }
        });
    }
}
exports.PermissionController = PermissionController;
