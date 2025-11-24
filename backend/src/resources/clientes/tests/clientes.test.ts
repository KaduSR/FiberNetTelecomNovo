// FIX: Added imports for jest globals
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { QueryBase } from "../../base";
import { Clientes } from "..";

jest.mock('../../base');

describe('Clientes', () => {
    let instance: Clientes;
    let mockRequest: jest.SpyInstance;

    beforeEach(() => {
        instance = new Clientes({
            token: 'fake-token',
            baseUrl: 'https://fake-url.com',
        });
        mockRequest = jest.spyOn(QueryBase.prototype, 'request');
        mockRequest.mockResolvedValue({ registros: [] });
    });

    afterEach(() => {
        mockRequest.mockRestore();
    });

    describe('filtrarClientes', () => {
        it('deve construir a query de filtro corretamente', async () => {
            await instance.filtrarClientes({ razao: 'Empresa Teste' }, 'like', 1, 'id', 'asc');

            expect(mockRequest).toHaveBeenCalledWith('v1/cliente', {
                qtype: 'cliente.razao',
                query: 'Empresa Teste',
                oper: 'like',
                page: 1,
                sortname: 'cliente.id',
                sortorder: 'asc',
            });
        });

        it('deve retornar a lista de registros da resposta', async () => {
            const mockClientes = [{ id: 1 }, { id: 2 }];
            mockRequest.mockResolvedValue({ registros: mockClientes });
            const result = await instance.filtrarClientes({ ativo: 'S' });
            expect(result).toEqual(mockClientes);
        });
    });

    describe('buscarClientesPorCpfCnpj', () => {
        it('deve chamar a API com os parâmetros corretos', async () => {
            const cpfCnpj = '12345678901';
            await instance.buscarClientesPorCpfCnpj(cpfCnpj);
            expect(mockRequest).toHaveBeenCalledWith('v1/cliente', {
                qtype: 'cliente.cnpj_cpf',
                query: cpfCnpj,
                oper: '=',
                page: 1,
                sortname: 'cliente.cnpj_cpf',
                sortorder: 'asc',
            });
        });

        it('deve retornar o cliente encontrado', async () => {
            const mockCliente = { id: 1, cnpj_cpf: '12345678901' };
            mockRequest.mockResolvedValue({ registros: [mockCliente] });
            const result = await instance.buscarClientesPorCpfCnpj('12345678901');
            expect(result).toEqual(mockCliente);
        });

        it('deve retornar null se nenhum cliente for encontrado', async () => {
            mockRequest.mockResolvedValue({ registros: [] });
            const result = await instance.buscarClientesPorCpfCnpj('000');
            expect(result).toBeNull();
        });
    });

    describe('buscarClientesPorId', () => {
        it('deve chamar a API com o ID correto', async () => {
            const id = 123;
            await instance.buscarClientesPorId(id);
            expect(mockRequest).toHaveBeenCalledWith('v1/cliente', {
                qtype: 'cliente.id',
                query: id.toString(),
                oper: '=',
                page: 1,
                sortname: 'cliente.id',
                sortorder: 'asc',
            });
        });
        
        it('deve retornar o cliente encontrado', async () => {
            const mockCliente = { id: 123 };
            mockRequest.mockResolvedValue({ registros: [mockCliente] });
            const result = await instance.buscarClientesPorId(123);
            expect(result).toEqual(mockCliente);
        });
    });
});