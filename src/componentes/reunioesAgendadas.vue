<template>
  <!--Tabela oculta somente para relatorio-->
  <div id="relatorio-pdf" style="display: none">
    <table style="width: 100%; border-collapse: collapse" border="1">
      <thead>
        <tr>
          <th style="padding: 8px">#</th>
          <th style="padding: 8px">Data</th>
          <th style="padding: 8px">Evento</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>

  <div class="q-pa-md">
    <q-table title="Agendamentos" :rows="agendamentos" :columns="columns" row-key="name">
      <template v-slot:top>
        <router-link :to="{ name: 'home' }">
          <q-avatar size="100px" class="q-mb-sm">
            <img src="../assets/logovictoriasmobile.png" />
          </q-avatar>
        </router-link>

        <span class="text-h5">Agendamentos</span>

        <q-space />
        <q-btn color="primary" label="Novo" :to="{ name: 'agendarEvento' }" />
        <q-btn label="Exportar PDF" color="primary" @click="gerarPDF" />
      </template>

      <template v-slot:body-cell-acoes="props">
        <q-td :props="props" class="q-gutter-sm">
          <q-btn
            icon="edit"
            color="info"
            dense
            size="sm"
            @click="handleEditarAgenda(props.row.id)"
          />
          <q-btn
            icon="delete"
            color="negative"
            dense
            size="sm"
            @click="handleExcluirAgenda(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
import agendaServicos from 'src/servicos/agenda'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import autenticar from 'src/servicos/autenticar'
import html2pdf from 'html2pdf.js'

export default defineComponent({
  name: 'reunioesAgendadas',

  setup() {
    const agendamentos = ref([])
    const { listar, excluir } = agendaServicos()
    const columns = [
      { name: 'id', field: 'id', label: 'ID', sortable: true, align: 'center' },
      { name: 'data', field: 'data', label: 'DATA', sortable: true, align: 'center' },
      { name: 'evento', field: 'evento', label: 'EVENTO', sortable: true, align: 'center' },
      { name: 'acoes', field: 'acoes', label: 'Ações', align: 'center' },
      //{ name: 'horaInicio', field: 'horaInicio', label: 'Hora Inicio', sortable: true, align: 'center',},
      // { name: 'horaFim', field: 'horaFim', label: 'Hora Fim', sortable: true, align: 'center' },
    ]

    const $q = useQuasar()
    const router = useRouter()

    onMounted(() => {
      if (!autenticar.isAuthenticated()) {
        router.push({ name: 'login' })
      } else {
        getAgenda()
      }
    })

    const getAgenda = async () => {
      try {
        const data = await listar()
        agendamentos.value = data
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error)
      }
    }

    const handleExcluirAgenda = async (id) => {
      try {
        $q.dialog({
          title: 'Excluir Agendamento',
          message: 'Tem certeza que deseja remover este agendamento?',
          cancel: true,
          persistent: true,
        }).onOk(async () => {
          // onOk verifica se clicou no Ok e confirma para excluir
          await excluir(id)
          $q.notify({ message: 'removido com sucesso', icon: 'check', color: 'positive' })
          await getAgenda()
        })
      } catch (error) {
        alert(error)
      }
    }

    const handleEditarAgenda = (id) => {
      router.push({ name: 'agendarEvento', params: { id } })
    }

    const gerarPDF = () => {
      const elemento = document.getElementById('relatorio-pdf')
      if (!elemento) {
        console.error('Elemento relatorio não encontrado!')
        return
      }

      //clona e ordena os agendamentos por data
      const agendamentosOrdenados = [...agendamentos.value].sort((a, b) => {
        const extrairDataHora = (texto) => {
          const regex = /(\d{2})\/(\d{2})\/(\d{4})\s+das\s+(\d{2}):(\d{2})h as (\d{2}):(\d{2})h/
          const match = texto.match(regex)
          if (match) {
            const [, dia, mes, ano, hora, minuto] = match
            return new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}:00`)
          } else {
            console.warn('Formato inesperado:', texto)
            return new Date(0) // << agora cai pro inicio se não casar
          }
        }

        const dataHoraA = extrairDataHora(a.data)
        const dataHoraB = extrairDataHora(b.data)

        return dataHoraA - dataHoraB
      })

      //preenche manualmente o relatorio com agendamentos ordenados
      const tbody = elemento.querySelector('tbody')
      tbody.innerHTML = '' //limpa antes de popular

      agendamentosOrdenados.forEach((agendamento, index) => {
        const linha = document.createElement('tr')
        linha.innerHTML = `
          <td>${index + 1}</td>
          <td>${agendamento.data}</td>
          <td>${agendamento.evento}</td>
          `
        tbody.appendChild(linha)
      })

      //cria o titulo
      const titulo = document.createElement('h1')
      titulo.textContent = 'Relatório de Agendamentos'
      titulo.style.textAlign = 'center'
      titulo.style.marginBottom = '10px'
      titulo.style.fontSize = '24px'
      titulo.id = 'titulo-relatorio'

      //inserir data e hora atual no cabecalho
      const dataAtual = new Date().toLocaleString('pt-BR')
      const dataElemento = document.createElement('p')
      dataElemento.textContent = `Gerado em: ${dataAtual}`
      dataElemento.style.textAlign = 'right'
      dataElemento.style.marginBottom = '20px'
      dataElemento.id = 'data-relatorio'

      // Insere o título e data no topo
      elemento.insertBefore(titulo, elemento.firstChild)
      elemento.insertBefore(dataElemento, titulo.nextSibling)

      elemento.style.display = 'block' //torna visivel para o html2pdf capturar

      const opcoes = {
        margin: 10,
        filename: 'relatorio-agendamentos.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }

      html2pdf()
        .set(opcoes)
        .from(elemento)
        .save()
        .then(() => {
          elemento.style.display = 'none'
          // Remove o título para não ficar duplicando se gerar PDF de novo
          const tituloRemover = document.getElementById('titulo-relatorio')
          if (tituloRemover) {
            tituloRemover.remove()
          }
        })
    }

    return {
      agendamentos,
      columns,
      handleExcluirAgenda,
      handleEditarAgenda,
      gerarPDF,
    }
  },
})
</script>
