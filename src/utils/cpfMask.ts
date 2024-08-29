export function maskCPF(cpf: string) {
  const cpfNumbers = cpf.replace(/\D/g, '')

  const limitedNumbers = cpfNumbers.slice(0, 11)

  let formattedCpf = limitedNumbers.replace(/(\d{3})(\d)/, '$1.$2')
  formattedCpf = formattedCpf.replace(/(\d{3})(\d)/, '$1.$2')
  formattedCpf = formattedCpf.replace(/(\d{3})(\d)/, '$1-$2')

  return formattedCpf
}
