var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import * as es from 'es-entity';
let Employee = class Employee {
    id;
    name;
    crtdAt;
};
__decorate([
    es.decorators.Id,
    es.decorators.Column(),
    __metadata("design:type", Number)
], Employee.prototype, "id", void 0);
__decorate([
    es.decorators.Column(),
    __metadata("design:type", String)
], Employee.prototype, "name", void 0);
__decorate([
    es.decorators.Column('crtd_at'),
    __metadata("design:type", Date)
], Employee.prototype, "crtdAt", void 0);
Employee = __decorate([
    es.decorators.Table('employee')
], Employee);
export default Employee;
//# sourceMappingURL=Employee.js.map