import { TestBed } from "@angular/core/testing";
import { SelectComponent } from "./select.component";
import {userEvent} from '@testing-library/user-event'
import {render, screen} from '@testing-library/angular'
import { SelectableOption } from "./models/select.models";

describe('SelectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SelectComponent]
    });
  });

    it('should create', () => {
        const fixture = TestBed.createComponent(SelectComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('single select behavior', async () => {
        const user = userEvent.setup()
        const renderResult = await render(SelectComponent, {
            inputs: {
                items: [
                    { label: 'item1', value: 'item1' },
                    { label: 'item2', value: 'item2' },
                    { label: 'item3', value: 'item3' },
                ],
            }
        })

        const instance = renderResult.fixture.componentRef.instance

        const button = screen.getByRole('button')

        expect(button).toBeTruthy()

        await user.click(screen.getByRole('button'))

        expect(instance.activeList()).toBe(true)

        const list = screen.getByRole('list')
        
        expect(list).toBeTruthy()
        expect(list).toBeVisible()

        expect(list.children.length).toBe(3)

        expect(list.children[0]).toHaveTextContent('item1')
        expect(list.children[1]).toHaveTextContent('item2')
        expect(list.children[2]).toHaveTextContent('item3')

        const labelItem = list.children[0].querySelector('label')

        expect(labelItem).toBeTruthy()

        if (labelItem == null) return

        await user.click(labelItem)

        expect(instance.activeList()).toBe(false)

        const mockSelectedOption: SelectableOption<{ label: string, value: string }> = {
            option: {
                value: 'item1',
                label: 'item1',
                show: true,
                checked: true
            },
            originItem: { label: 'item1', value: 'item1' }
        }

        expect(instance.selectedItems()).toEqual([mockSelectedOption])

        expect(screen.getByRole('button').textContent).toBe('item1')
    });

    it('multiple select behavior', async () => {
        const user = userEvent.setup()
        const renderResult = await render(SelectComponent, {
            inputs: {
                items: [
                    { label: 'item1', value: 'item1' },
                    { label: 'item2', value: 'item2' },
                    { label: 'item3', value: 'item3' },
                ],
                multiple: true
            }
        })

        const instance = renderResult.fixture.componentRef.instance

        const button = screen.getByRole('button')

        expect(button).toBeTruthy()

        await user.click(screen.getByRole('button'))

        expect(instance.activeList()).toBe(true)

        const list = screen.getByRole('list')
        
        expect(list).toBeTruthy()
        expect(list).toBeVisible()

        expect(list.children.length).toBe(3)

        expect(list.children[0]).toHaveTextContent('item1')
        expect(list.children[1]).toHaveTextContent('item2')
        expect(list.children[2]).toHaveTextContent('item3')

        const labelItem = list.children[0].querySelector('label')

        expect(labelItem).toBeTruthy()

        if (labelItem == null) return

        await user.click(labelItem)

        

        const mockSelectedOption: SelectableOption<{ label: string, value: string }> = {
            option: {
                value: 'item1',
                label: 'item1',
                show: true,
                checked: true
            },
            originItem: { label: 'item1', value: 'item1' }
        }

        expect(instance.selectedItems()).toEqual([mockSelectedOption])

        expect(screen.getByRole('button').textContent).toBe('item1')

        await user.click(screen.getByRole('button'))

        const listItems = screen.getAllByRole('listitem')

        expect(listItems.length).toBe(3)

        const labelItem2 = listItems[1].querySelector('label')

        expect(labelItem2).toBeTruthy()

        if (labelItem2 == null) return

        await user.click(labelItem2)

        const mockSelectedOption2: SelectableOption<{ label: string, value: string }> = {
            option: {
                value: 'item2',
                label: 'item2',
                show: true,
                checked: true
            },
            originItem: { label: 'item2', value: 'item2' }
        }

        expect(instance.selectedItems()).toEqual([mockSelectedOption, mockSelectedOption2])
    })
});