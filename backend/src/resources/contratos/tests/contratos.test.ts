// FIX: Added imports for jest globals
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { QueryBase } from "../../base";
import { Contratos } from "..";

jest.mock('../../base');

describe('Contratos', () => {
    let instance: Contratos;
    let mockRequest: jest.SpyInstance;

    beforeEach(() => {
        instance = new Contratos({
            token: 'fake-token',
            baseUrl: 'https://fake-url.com',
        });
        mockRequest = jest.spyOn(QueryBase.prototype, 'request');
        mockRequest.mockResolvedValue({ registros: [] }); 
    });

    afterEach(() => {
        mockRequest.mockRestore();
    });

    describe('filtrarContratos', () => {
        it('deve chamar a API com os parâmetros corretos', async () => {
            await instance.filtrarContratos({ id_cliente: 123 }, '=', 1, 'id', 'asc');

            expect(mockRequest).toHaveBeenCalledWith('v1/cliente_contrato', {
                qtype: 'cliente_contrato.id_cliente',
                query: 123,
                oper: '=',
                page: 1,
                sortname: 'cliente_contrato.id',
                sortorder: 'asc',
            });
        });

        it('deve retornar a lista de registros da resposta', async () => {
            const mockContratos = [{ id: 1 }, { id: 2 }];
            mockRequest.mockResolvedValue({ registros: mockContratos });

            const result = await instance.filtrarContratos({ status: 'A' });
            expect(result).toEqual(mockContratos);
        });
    });

    describe('buscarContratosPorId', () => {
        it('deve chamar a API com o ID correto', async () => {
            const id = 456;
            mockRequest.mockResolvedValue({ registros: [{ id }] });
            await instance.buscarContratosPorId(id);

            expect(mockRequest).toHaveBeenCalledWith('v1/cliente_contrato', {
                qtype: 'cliente_contrato.id',
                query: id.toString(),
                oper: '=',
                page: 1,
                sortname: 'cliente_contrato.id',
                sortorder: 'asc',
            });
        });

        it('deve retornar o primeiro contrato da lista', async () => {
            const mockContrato = { id: 456 };
            mockRequest.mockResolvedValue({ registros: [mockContrato, { id: 789 }] });

            const result = await instance.buscarContratosPorId(456);
            expect(result).toEqual(mockContrato);
        });

        it('deve retornar undefined se nenhum registro for encontrado', async () => {
            mockRequest.mockResolvedValue({ registros: [] });
            const result = await instance.buscarContratosPorId(1);
            expect(result).toBeUndefined();
        });

        it('deve retornar um erro se a requisição falhar', async () => {
            mockRequest.mockRejectedValueOnce(new Error('Falha na requisição'));
            await expect(instance.buscarContratosPorId(1)).rejects.toThrow('Falha na requisição');
        });
    });

    describe('buscarContratosPorIdCliente', () => {
        it('deve chamar a API com o ID do cliente correto', async () => {
            const idCliente = 789;
            await instance.buscarContratosPorIdCliente(idCliente);

            expect(mockRequest).toHaveBeenCalledWith('v1/cliente_contrato', {
                qtype: 'cliente_contrato.id_cliente',
                query: idCliente.toString(),
                oper: '=',
                page: 1,
                sortname: 'cliente_contrato.id',
                sortorder: 'asc',
            });
        });

        it('deve retornar uma lista de contratos', async () => {
            const mockResponse = { registros: [{ id: 1, id_cliente: 1 }] };
            mockRequest.mockResolvedValueOnce(mockResponse);

            const result = await instance.buscarContratosPorIdCliente(1);
            expect(result).toEqual(mockResponse.registros);
        });

        it('deve retornar uma lista vazia se não houver registros', async () => {
            mockRequest.mockResolvedValue({ registros: [] });
            const result = await instance.buscarContratosPorIdCliente(999);
            expect(result).toEqual([]);
        });
        
        it('deve retornar um erro se a requisição falhar', async () => {
            mockRequest.mockRejectedValueOnce(new Error('Falha na requisição'));
            await expect(instance.buscarContratosPorIdCliente(1)).rejects.toThrow('Falha na requisição');
        });
    });
});