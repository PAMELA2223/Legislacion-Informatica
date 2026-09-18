import type { Rol } from "@prisma/client";
import type { DatosDocumentoBiblioteca, IAdminRepository } from "../domain/admin-repository.interface";
import type {
  AdminFaqRow,
  DatosPregunta,
  AdminGlossaryRow,
  AdminInfographicRow,
  AdminInternationalReferenceRow,
  AdminJurisprudenceRow,
  AdminNewsRow,
  AdminVideoRow,
} from "../domain/admin.entity";

export class ListarUsuariosUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarUsuarios();
  }
}

export class CambiarRolUsuarioUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, userId: string, rol: Rol) {
    return this.repo.cambiarRolUsuario(actorId, userId, rol);
  }
}

export class EliminarUsuarioUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, userId: string) {
    if (actorId === userId) {
      throw new Error("No puedes eliminar tu propia cuenta de administrador.");
    }
    return this.repo.eliminarUsuario(actorId, userId);
  }
}

export class ListarLogsUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(limite?: number) {
    return this.repo.listarLogs(limite);
  }
}

export class ListarNoticiasAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarNoticias();
  }
}

export class ObtenerNoticiaAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const noticia = await this.repo.obtenerNoticia(id);
    if (!noticia) throw new Error("Noticia no encontrada.");
    return noticia;
  }
}

export class GuardarNoticiaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string | null, data: Omit<AdminNewsRow, "id">) {
    if (!data.titulo?.trim()) throw new Error("El título es obligatorio.");
    if (id) return this.repo.actualizarNoticia(actorId, id, data);
    return this.repo.crearNoticia(actorId, data);
  }
}

export class EliminarNoticiaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarNoticia(actorId, id);
  }
}

export class ListarGlosarioAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarGlosario();
  }
}

export class ObtenerTerminoGlosarioAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const termino = await this.repo.obtenerTerminoGlosario(id);
    if (!termino) throw new Error("Término no encontrado.");
    return termino;
  }
}

export class GuardarTerminoGlosarioUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string | null, data: Omit<AdminGlossaryRow, "id">) {
    if (!data.termino?.trim()) throw new Error("El término es obligatorio.");
    if (id) return this.repo.actualizarTerminoGlosario(actorId, id, data);
    return this.repo.crearTerminoGlosario(actorId, data);
  }
}

export class EliminarTerminoGlosarioUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarTerminoGlosario(actorId, id);
  }
}

export class ListarBibliotecaAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarBiblioteca();
  }
}

export class ObtenerDocumentoBibliotecaAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const documento = await this.repo.obtenerDocumentoBiblioteca(id);
    if (!documento) throw new Error("Documento no encontrado.");
    return documento;
  }
}

export class GuardarDocumentoBibliotecaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string | null, data: DatosDocumentoBiblioteca) {
    if (!data.titulo?.trim()) throw new Error("El título es obligatorio.");
    // No se inventa una URL: si se ingresa un enlace oficial, debe tener
    // forma de URL; si no se ingresa, se guarda vacío (la UI indicará que
    // requiere revisión administrativa).
    if (data.enlaceOficial && !/^https?:\/\//i.test(data.enlaceOficial)) {
      throw new Error("El enlace oficial debe ser una URL válida (http:// o https://).");
    }
    if (id) return this.repo.actualizarDocumentoBiblioteca(actorId, id, data);
    return this.repo.crearDocumentoBiblioteca(actorId, data);
  }
}

export class EliminarDocumentoBibliotecaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarDocumentoBiblioteca(actorId, id);
  }
}

export class ListarCursosAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarCursos();
  }
}

export class ListarEvaluacionesAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarEvaluaciones();
  }
}

export class ObtenerEvaluacionConPreguntasUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const evaluacion = await this.repo.obtenerEvaluacionConPreguntas(id);
    if (!evaluacion) throw new Error("Evaluación no encontrada.");
    return evaluacion;
  }
}

export class EliminarEvaluacionUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarEvaluacion(actorId, id);
  }
}

export class CrearPreguntaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, evaluationId: string, data: DatosPregunta) {
    if (!data.enunciado?.trim()) throw new Error("El enunciado es obligatorio.");
    if (!data.retroalimentacion?.trim()) throw new Error("La retroalimentación es obligatoria.");
    if (!data.puntaje || data.puntaje < 1) throw new Error("El puntaje debe ser al menos 1.");
    if (!data.respuestaCorrecta) throw new Error("La respuesta correcta es obligatoria.");
    return this.repo.crearPregunta(actorId, evaluationId, data);
  }
}

export class EliminarPreguntaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarPregunta(actorId, id);
  }
}

export class ListarCasosAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarCasos();
  }
}

export class EliminarCasoUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarCaso(actorId, id);
  }
}

export class ListarHilosForoAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarHilosForo();
  }
}

export class EliminarHiloForoUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarHiloForo(actorId, id);
  }
}

export class ListarFaqAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarFaq();
  }
}

export class ObtenerPreguntaFaqAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const pregunta = await this.repo.obtenerPreguntaFaq(id);
    if (!pregunta) throw new Error("Pregunta no encontrada.");
    return pregunta;
  }
}

export class GuardarPreguntaFaqUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string | null, data: Omit<AdminFaqRow, "id">) {
    if (!data.pregunta?.trim()) throw new Error("La pregunta es obligatoria.");
    if (!data.respuesta?.trim()) throw new Error("La respuesta es obligatoria.");
    if (id) return this.repo.actualizarPreguntaFaq(actorId, id, data);
    return this.repo.crearPreguntaFaq(actorId, data);
  }
}

export class EliminarPreguntaFaqUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarPreguntaFaq(actorId, id);
  }
}

export class ListarJurisprudenciaAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarJurisprudencia();
  }
}

export class ObtenerCasoJurisprudenciaAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const caso = await this.repo.obtenerCasoJurisprudencia(id);
    if (!caso) throw new Error("Caso no encontrado.");
    return caso;
  }
}

export class GuardarCasoJurisprudenciaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string | null, data: Omit<AdminJurisprudenceRow, "id">) {
    if (!data.nombreCaso?.trim()) throw new Error("El nombre del caso es obligatorio.");
    if (!data.fuenteOficial?.trim()) throw new Error("La fuente oficial es obligatoria.");
    // Regla explícita del pedido: no se inventan casos ni fuentes. Un caso
    // solo puede marcarse "verificado" si tiene un enlace oficial real
    // acompañándolo — de lo contrario queda como no verificado.
    if (data.verificado && !data.enlaceOficial?.trim()) {
      throw new Error(
        "No se puede marcar un caso como verificado sin un enlace oficial. Agrega el enlace o desmarca la verificación."
      );
    }
    if (data.enlaceOficial && !/^https?:\/\//i.test(data.enlaceOficial)) {
      throw new Error("El enlace oficial debe ser una URL válida (http:// o https://).");
    }
    if (id) return this.repo.actualizarCasoJurisprudencia(actorId, id, data);
    return this.repo.crearCasoJurisprudencia(actorId, data);
  }
}

export class EliminarCasoJurisprudenciaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarCasoJurisprudencia(actorId, id);
  }
}

export class ListarVideosAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarVideos();
  }
}

export class ObtenerVideoAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const video = await this.repo.obtenerVideo(id);
    if (!video) throw new Error("Video no encontrado.");
    return video;
  }
}

export class GuardarVideoUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string | null, data: Omit<AdminVideoRow, "id">) {
    if (!data.titulo?.trim()) throw new Error("El título es obligatorio.");
    if (!data.url?.trim() || !/^https?:\/\//i.test(data.url)) {
      throw new Error("El video debe tener una URL real (http:// o https://). No se permiten enlaces inventados.");
    }
    if (!data.fuente?.trim()) throw new Error("La fuente (canal/institución) es obligatoria.");
    if (id) return this.repo.actualizarVideo(actorId, id, data);
    return this.repo.crearVideo(actorId, data);
  }
}

export class EliminarVideoUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarVideo(actorId, id);
  }
}

export class ListarInfografiasAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarInfografias();
  }
}

export class ObtenerInfografiaAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const infografia = await this.repo.obtenerInfografia(id);
    if (!infografia) throw new Error("Infografía no encontrada.");
    return infografia;
  }
}

export class GuardarInfografiaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string | null, data: Omit<AdminInfographicRow, "id">) {
    if (!data.titulo?.trim()) throw new Error("El título es obligatorio.");
    if (!data.url?.trim() || !/^https?:\/\//i.test(data.url)) {
      throw new Error("La infografía debe tener una URL real (http:// o https://). No se permiten enlaces inventados.");
    }
    if (!data.fuente?.trim()) throw new Error("La fuente (institución/organización) es obligatoria.");
    if (id) return this.repo.actualizarInfografia(actorId, id, data);
    return this.repo.crearInfografia(actorId, data);
  }
}

export class EliminarInfografiaUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarInfografia(actorId, id);
  }
}

export class ListarReferenciasInternacionalesAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute() {
    return this.repo.listarReferenciasInternacionales();
  }
}

export class ObtenerReferenciaInternacionalAdminUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(id: string) {
    const referencia = await this.repo.obtenerReferenciaInternacional(id);
    if (!referencia) throw new Error("Referencia no encontrada.");
    return referencia;
  }
}

export class GuardarReferenciaInternacionalUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string | null, data: Omit<AdminInternationalReferenceRow, "id">) {
    if (!data.titulo?.trim()) throw new Error("El título es obligatorio.");
    if (!data.organismo?.trim()) throw new Error("El organismo emisor es obligatorio.");
    if (!data.urlOficial?.trim() || !/^https?:\/\//i.test(data.urlOficial)) {
      throw new Error("La referencia debe tener una URL oficial real (http:// o https://). No se permiten enlaces inventados.");
    }
    if (id) return this.repo.actualizarReferenciaInternacional(actorId, id, data);
    return this.repo.crearReferenciaInternacional(actorId, data);
  }
}

export class EliminarReferenciaInternacionalUseCase {
  constructor(private readonly repo: IAdminRepository) {}
  async execute(actorId: string, id: string) {
    return this.repo.eliminarReferenciaInternacional(actorId, id);
  }
}
