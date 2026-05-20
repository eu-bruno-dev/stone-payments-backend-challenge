import { ID } from './id';

describe('[ID] Test', () => {
  it('should be able to create a new EntityId', () => {
    const newEntityId = new ID();

    expect(newEntityId).toBeInstanceOf(ID);
  });

  it('should be able to create a new EntityId with specified id', () => {
    const newObjectId = new ID('id-test');
    const anotherObjectId = new ID();

    expect(newObjectId.toValue()).toEqual('id-test');
    expect(anotherObjectId.isValid()).toBeTruthy();
  });
  it('should be able to compare two EntityId', () => {
    const newObjectId = new ID('id-test');
    const anotherObjectId = new ID('id-test');
    expect(newObjectId.equals(anotherObjectId)).toBeTruthy();
  });
  it('should generate a valid cuid2 ID', () => {
    const newEntityId = new ID();

    expect(newEntityId.isValid()).toBeTruthy();
  });
  it('should be able to generate a valid predefined cuid2 ID', () => {
    const id = 'esmjt65n6qqjuyom97k1ucss';

    const newEntityId = new ID(id);

    expect(newEntityId).toBeInstanceOf(ID);
    expect(newEntityId.toValue()).toEqual('esmjt65n6qqjuyom97k1ucss');
  });
});
