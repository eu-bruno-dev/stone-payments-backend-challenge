export abstract class ValueObject<Props> {
  protected readonly props: Props;

  constructor(props: Props) {
    this.props = Object.freeze(props);
  }

  // public equals(vo: ValueObject<unknown>) {
  //   if (vo === null || vo === undefined) return false;

  //   if (vo.props === undefined) return false;

  //   return JSON.stringify(vo.props) === JSON.stringify(this.props);
  // }

  public equals(other: ValueObject<Props>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
