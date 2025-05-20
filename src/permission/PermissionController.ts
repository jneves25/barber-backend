// src/controllers/PermissionController.ts
import { Request, Response } from 'express';
import { PermissionService } from './PermissionService';

const permissionService = new PermissionService();

export class PermissionController {
  static async createPermission(req: Request, res: Response) {
    try {
      const data = req.body;
      const permission = await permissionService.createPermission(data);
      res.status(201).json(permission);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar permissão', error });
    }
  }

  static async getAllPermissions(req: Request, res: Response) {
    try {
      const permissions = await permissionService.getAllPermissions();
      res.status(200).json(permissions);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao obter permissões', error });
    }
  }

  static async getPermissionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const permission = await permissionService.getPermissionById(parseInt(id));
      if (permission) {
        res.status(200).json(permission);
      } else {
        res.status(404).json({ message: 'Permissão não encontrada' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erro ao obter permissão', error });
    }
  }

  static async updatePermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedPermission = await permissionService.updatePermission(parseInt(id), data);
      res.status(200).json(updatedPermission);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar permissão', error });
    }
  }

  static async deletePermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedPermission = await permissionService.deletePermission(parseInt(id));
	  if(deletedPermission){
		res.status(204);
		return;
	}
        res.status(404).json({ message: 'Permissão não encontrada' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir permissão', error });
    }
  }
}
