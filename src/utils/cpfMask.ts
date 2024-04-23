function maskCPF(cpf: string) {
  const numerosCPF = cpf.replace(/\D/g, '')

  const numerosLimitados = numerosCPF.slice(0, 11)

  let cpfFormatado = numerosLimitados.replace(/(\d{3})(\d)/, '$1.$2')
  cpfFormatado = cpfFormatado.replace(/(\d{3})(\d)/, '$1.$2')
  cpfFormatado = cpfFormatado.replace(/(\d{3})(\d)/, '$1-$2')

  return cpfFormatado
}

export default maskCPF
