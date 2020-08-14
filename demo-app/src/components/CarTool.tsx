import React, { FC, useState } from 'react';

import { Car } from '../models/Car';
import { useList } from '../hooks/useList';

import { ToolHeader } from './ToolHeader';
import { ToolFooter } from './ToolFooter';
import { CarTableSortSettings, CarTable } from './CarTable';
import { CarForm } from './CarForm';
import { ConfirmModal } from './ConfirmModal';
import { CarTableFilterSettings, CarTableFilterForm } from './CarTableFilterForm';

export type CarToolProps = {
  cars: Car[],
};

const carTableCache = new Map<string, Car[]>();

const clearCarTableCache = () => {
  carTableCache.clear();
};

const getCarTableCacheKey = (filterSettings: CarTableFilterSettings, sortSettings: CarTableSortSettings) => {

  return btoa(
    filterSettings.filterField + ':' +
    filterSettings.filterValue + ':' +
    sortSettings.col + ':' +
    sortSettings.dir);

};

const getCars = (cars: Car[], filterSettings: CarTableFilterSettings, sortSettings: CarTableSortSettings) => {

  const cacheKey = getCarTableCacheKey(filterSettings, sortSettings);

  if (!carTableCache.has(cacheKey)) {

    console.log('performing filter and sort');

    const filteredCars = cars.filter(car => {
      return String(car[filterSettings!.filterField]!).includes(filterSettings.filterValue);
    });

    const sortedCars = filteredCars.sort( (a: Car, b: Car) => {

      if (a[sortSettings.col]! > b[sortSettings.col]!) {
        return sortSettings.dir === 'asc' ? 1 : -1;
      } else if (a[sortSettings.col]! < b[sortSettings.col]!) {
        return sortSettings.dir === 'asc' ? -1 : 1;
      } else {
        return 0;
      }

    });

    carTableCache.set(cacheKey, sortedCars);
  }

  return carTableCache.get(cacheKey);

};

export const CarTool: FC<CarToolProps> = (props) => {

  const [ editCarId, setEditCarId ] = useState(-1);

  const [ confirmDeleteCarId, setConfirmDeleteCarId ] = useState(-1);
  const [ carTableFilterSettings, setCarTableFilterSettings ] = useState<CarTableFilterSettings>({ filterField: 'id', filterValue: '' });
  const [ carTableSortSettings, setCarTableSortSettings ] = useState<CarTableSortSettings>({ col: 'id', dir: 'asc' });

  const [ cars, appendCar, removeCar, replaceCar ] = useList(props.cars.concat());

  const cancelCar = () => setEditCarId(-1);

  const addCar = (car: Car) => {
    appendCar(car);
    cancelCar();
    clearCarTableCache();
  };

  const confirmDeleteCar = (carId: number) => {
    setConfirmDeleteCarId(carId);
  };

  const deleteCar = (carId: number) => {
    removeCar(carId);
    cancelCar();
    clearCarTableCache();
    dismissConfirmDeleteCarModal();
  };

  const saveCar = (car: Car) => {
    replaceCar(car);
    cancelCar();
    clearCarTableCache();
  };

  const getCarDetailsById = (carId: number) => {
    const { make, model, year } = cars.find(car => car.id === carId)!;
    return make + ' ' + model + ' ' + String(year);
  };

  const dismissConfirmDeleteCarModal = () => {
    setConfirmDeleteCarId(-1);
  };

  return (
    <>
      <ToolHeader headerText="Car Tool" />
      <CarTableFilterForm onFilter={setCarTableFilterSettings} />
      <CarTable cars={getCars(cars, carTableFilterSettings, carTableSortSettings)}
        editCarId={editCarId} sort={carTableSortSettings}
        onEditCar={setEditCarId} onDeleteCar={confirmDeleteCar}
        onSaveCar={saveCar} onCancelCar={cancelCar} onSort={setCarTableSortSettings} />
      <CarForm buttonText="Add Car" onSubmitCar={addCar} />
      <ToolFooter companyName="A Cool Company, Inc." />
      {confirmDeleteCarId > 0 && <ConfirmModal
        onYes={() => deleteCar(confirmDeleteCarId)}
        onNo={dismissConfirmDeleteCarModal}>
          Are you sure you want to delete {getCarDetailsById(confirmDeleteCarId)}
        </ConfirmModal>}
    </>
  );

};