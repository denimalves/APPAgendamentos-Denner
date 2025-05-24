import { api } from 'boot/axios'

export default function useApi(url) {
  const listar = async () => {
    try {
      const { data } = await api.get(url)
      return data
    } catch (error) {
      throw new Error(error)
    }
  }

  const getById = async (id) => {
    //try {
    const { data } = await api.get(`${url}/${id}`)
    return data
    // } catch (error) {
    //   throw new Error(error)
    //}
  }

  const inserir = async (dadosForm) => {
    try {
      const { data } = await api.post(url, dadosForm)
      return data
    } catch (error) {
      throw new Error(error)
    }
  }

  const atualizar = async (dadosForm) => {
    try {
      const { data } = await api.put(`${url}/${dadosForm.id}`, dadosForm)
      return data
    } catch (error) {
      throw new Error(error)
    }
  }

  const excluir = async (id) => {
    try {
      const { data } = await api.delete(`${url}/${id}`)
      return data
    } catch (error) {
      throw error(error)
    }
  }

  return { listar, inserir, atualizar, excluir, getById }
}
