import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';

@Component({
    selector       : 'fuse-navigation',
    templateUrl    : './navigation.component.html',
    styleUrls      : ['./navigation.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuseNavigationComponent implements OnInit
{
    @Input()
    layout = 'vertical';

    @Input()
    navigation: any;
    allNavigation: any;
    public userPermission = localStorage.getItem('userType');
    public accessArray = JSON.parse(localStorage.getItem('permissions'));

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     *
     * @param {ChangeDetectorRef} _changeDetectorRef
     * @param {FuseNavigationService} _fuseNavigationService
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        
        // Load the navigation either from the input or from the service
        this.allNavigation = this.navigation || this._fuseNavigationService.getCurrentNavigation();
        debugger;
        // if (this.userPermission == "Super User") {
        //     this.navigation = this.allNavigation;
        //     this._changeDetectorRef.markForCheck()
        // } 
        // else if (this.userPermission == "Normal User") {
        //     debugger;
        //     console.log(this.accessArray);
        //     var dashnav = this.allNavigation[0].children;
        //     var ordernav = this.allNavigation[0].children[1].children;
        //     var fabricnav = this.allNavigation[0].children[2].children;
        //     this.accessArray.filter(function (element) {
        //         // if (element.realTime == false) {
        //         //     var Dashboard = dashnav.map(function (e) { return e.id; }).indexOf('dashboard');
        //         //     dashnav.splice(Dashboard, 1);
        //         // }
        //         // if (element.orderEntry == false) {
        //         //     var Dashboard = ordernav.map(function (e) { return e.id; }).indexOf('orderentry');
        //         //     ordernav.splice(Dashboard, 1);
        //         // }
        //         // if (element.orderStatusReport == false) {
        //         //     var Dashboard = ordernav.map(function (e) { return e.id; }).indexOf('orderStatusReport');
        //         //     ordernav.splice(Dashboard, 1);
        //         // }

        //         // if (element.fabricInward == false) {
        //         //     var Dashboard = fabricnav.map(function (e) { return e.id; }).indexOf('fabricinward');
        //         //     fabricnav.splice(Dashboard, 1);
        //         // }
        //         // if (element.inspectionReport == false) {
        //         //     var Dashboard = fabricnav.map(function (e) { return e.id; }).indexOf('fabricinspectionreport');
        //         //     fabricnav.splice(Dashboard, 1);
        //         // }
        //         // if (element.issueTocutting == false) {
        //         //     var Dashboard = ordernav.map(function (e) { return e.id; }).indexOf('cuttingissue');
        //         //     ordernav.splice(Dashboard, 1);
        //         // }
        //         // if (element.fabricStockReport == false) {
        //         //     var Dashboard = ordernav.map(function (e) { return e.id; }).indexOf('fabricstockreport');
        //         //     ordernav.splice(Dashboard, 1);
        //         // }
        //     })
            this.navigation = this.allNavigation;
            this._changeDetectorRef.markForCheck();
        // }
        merge(
            this._fuseNavigationService.onNavigationItemAdded,
            this._fuseNavigationService.onNavigationItemUpdated,
            this._fuseNavigationService.onNavigationItemRemoved
        ).pipe(takeUntil(this._unsubscribeAll))
         .subscribe(() => {

             // Mark for check
             this._changeDetectorRef.markForCheck();
         });
    }
}
