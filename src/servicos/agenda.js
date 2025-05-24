import useApi from 'src/composables/UseApi'

export default function agendaServicos() {
  const { listar, inserir, atualizar, excluir, getById } = useApi('agendamentos')
  return { listar, inserir, atualizar, excluir, getById }
}
