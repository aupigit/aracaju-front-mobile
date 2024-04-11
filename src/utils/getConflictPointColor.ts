const getConflictPointColor = (index) => {
  switch (index) {
    case 0:
      return 'Amarelo'
    case 1:
      return 'Roxo'
    default:
      return 'Desconhecido'
  }
}

export default getConflictPointColor
