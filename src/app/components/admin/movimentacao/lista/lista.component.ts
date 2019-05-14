import { Movimentacao, Requisicao } from './../../../../models/requisicao.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RequisicaoService } from 'src/app/services/requisicao.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FuncionarioService } from 'src/app/services/funcionario.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Funcionario } from 'src/app/models/funcionario.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit {

  @Input() movimentacoes: Movimentacao[];
  @Input() requisicaoSelecionada: Requisicao;
  @Input() displayDialogMovimentacoes: boolean;
  @Input() funcionarioLogado: Funcionario;
  @Output() displayChange = new EventEmitter();

  listaStatus: string[];
  displayDialogMovimentacao: boolean;
  form: FormGroup;
  edit: boolean;

  constructor(
    private requisicaoService: RequisicaoService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.configForm();
    this.carregaStatus();
  }



  configForm() {
    this.form = this.fb.group({
      funcionario: new FormControl('', Validators.required),
      dataHora: new FormControl(''),
      status: new FormControl('', Validators.required),
      descricao: new FormControl('', Validators.required)
    })
  }

  selecionaMovimento(mov: Movimentacao) {
    this.edit = true;
    this.displayDialogMovimentacao = true;
    this.form.setValue(mov);
  }


  carregaStatus() {
    this.listaStatus = ['Aberto', 'Pendente', 'Processando', 'Não autorizada', 'Finalizado'];
  }

  save() {
    this.movimentacoes.push(this.form.value);
    this.requisicaoSelecionada.movimentacoes = this.movimentacoes;
    this.requisicaoSelecionada.status = this.form.controls['status'].value
    this.requisicaoSelecionada.ultimaAtualizacao = new Date();
    this.requisicaoService.createOrUpdate(this.requisicaoSelecionada)
      .then(() => {
        this.displayDialogMovimentacao = false;
        Swal.fire(`Requisição ${!this.edit ? 'salvo' : 'atualizado'} com sucesso.`, '', 'success');
      })
      .catch((erro) => {
        this.displayDialogMovimentacao = true;
        Swal.fire(`Erro ao ${!this.edit ? 'salvo' : 'atualizado'} o Requisição.`, `Detalhes: ${erro}`, 'error');
      })
    this.form.reset()
  }

  delete(mov: Movimentacao) {
    const movs = this.remove(this.movimentacoes, mov)
    Swal.fire({
      title: 'Confirma a exclusão do Requisição?',
      text: "",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then((result) => {
      if (result.value) {
        this.requisicaoSelecionada.movimentacoes = movs;
        this.requisicaoService.createOrUpdate(this.requisicaoSelecionada)
          .then(() => {
            Swal.fire('Requisição excluído com sucesso!', '', 'success')
            this.movimentacoes = movs;
          })
      }
    })
  }

  remove(array, element) {
    return array.filter(el => el !== element);
  }

  onClose() {
    this.displayChange.emit(false);
  }


}
